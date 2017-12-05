//
//  CDVLocalNotication.m
//  CordovaLib
//
//  Created by  Lead To Asia 2 on 2/26/13.
//
//

#import <EventKit/EventKit.h>
#import "CDVAlarmClock.h"
//#import "CDVSingletonEventStore.h"

#define kCDVAlarmClock_UUID           @"uuid"
#define kCDVAlarmClock_FireDate       @"date"
#define kCDVAlarmClock_TimeZone       @"timezone"
#define kCDVAlarmClock_RepeatInterval @"repeatInterval"
#define kCDVAlarmClock_AlertBody      @"alertBody"
#define kCDVLocalNotication_UUID           @"uuid"

#define KDictionary_Alarm              @"dictionary_alarm"


@interface CDVSingletonEventStore : NSObject

/**访问提醒
 
 调用单例eventStore用来访问提醒
 */

@property (strong, nonatomic) EKEventStore*  eventStore;

/**初始化提醒
 
 初始化EKEventStore
 */
+(id)shareObject;

@end


static CDVSingletonEventStore * object;

@implementation CDVSingletonEventStore

+(id)shareObject
{
    if (!object)
    {
        object = [[CDVSingletonEventStore alloc]init];
    }
    return object;
    
}

-(id)init
{
    self = [super init];
    
    if (self)
    {
        self.eventStore =  [[EKEventStore alloc]init];
    }
    return self;
}

@end

typedef void (^ReminderArray)(NSMutableArray *array);
typedef void (^ReminderBolck)(EKEvent *event);

@implementation CDVAlarmClock

/**************************************************************************************/

#pragma mark -
#pragma mark 公有
#pragma mark -

/**************************************************************************************/

/*
 add
 */

//输入参数是时间戳 推送信息 重复

- (void)addAlarmClock:(CDVInvokedUrlCommand*)command
{
    
    NSLog(@"增加提醒开始");
    
    //传入参数
    NSString  *dateStamp                    = [command.arguments count] > 0 ? [command.arguments objectAtIndex:0] : nil;
    NSString  *notificationAlertInformation = [command.arguments count] > 1 ? [command.arguments objectAtIndex:1] : nil;
    NSString *description                   = [command.arguments count] > 2 ? [command.arguments objectAtIndex:2] : nil;
    
    //如果不输入此参数为不重复
    NSString  * interval                    = [command.arguments count] > 3 ? [command.arguments objectAtIndex:3] : @"100";
    NSString  * beginDateStamp              = [command.arguments count] > 4 ? [command.arguments objectAtIndex:4] : nil;
    NSString  * lastDateStamp               = [command.arguments count] > 5 ? [command.arguments objectAtIndex:5] : nil;
    NSString  * location                    = [command.arguments count] > 6 ? [command.arguments objectAtIndex:6] : nil;
    NSString  * strBoolAhead                = [command.arguments count] > 7 ? [command.arguments objectAtIndex:7] : nil;
    NSString  *offSetTime                   = [command.arguments count] > 8 ? [command.arguments objectAtIndex:8] : nil;
    NSString  *uuid                         = [command.arguments count] > 9 ?  [command.arguments objectAtIndex:9]:  nil;
    
    NSLog(@"增加提醒输入参数uuid = %@",uuid);
    NSLog(@"增加提醒输入提醒信息 = %@",notificationAlertInformation);
    NSLog(@"增加提醒输入提醒的时间 = %@",dateStamp);
    NSLog(@"增加提醒的时间间隔 = %@",interval);
    
    if (!(uuid && notificationAlertInformation && interval) )
    {
        NSLog(@"参数不全");
        
        [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                         WithResultString:@"参数不全请查看info"
                               callbackId:command.callbackId];
        return;
    }
    
    //跟着版本走适当的途径
    if ([[[UIDevice currentDevice]systemVersion] floatValue] <= 5.0)
    {
        //查找是否存在
        UILocalNotification *localSearchNotification = [self _searchWithUUID:uuid];
        
        if (localSearchNotification != nil)
        {
            NSLog(@"增加提醒已经有这个id了uuid = %@",uuid);
            
            [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                             WithResultString:@"已经有这个id了"
                                   callbackId:command.callbackId];
            return;
        }
        
        [self _addLocalNotificationWithInformation:notificationAlertInformation
                                     WithTimeStamp:[NSDate dateWithTimeIntervalSince1970:dateStamp.doubleValue]
                                      WithTimeZone:[NSTimeZone systemTimeZone]
                                withRepeatInterval:[self _getNSCalendarUnitWithrepeatInterva:interval]
                                          withUUID:uuid];
        
        [self _sendResultWithPluginResult:CDVCommandStatus_OK
                         WithResultString:@"成功"
                               callbackId:command.callbackId];
    }
    else
    {
        CDVSingletonEventStore  *singletonEventStore = [CDVSingletonEventStore shareObject];
        
        EKEventStore *eventStore = singletonEventStore.eventStore;
        
        //查询是否授权
        [eventStore requestAccessToEntityType:EKEntityTypeEvent completion:^(BOOL granted, NSError *error)
         {
             
             if (!granted)
             {
                 NSLog(@"ios6增加用户日记本没有授权");
                 
                 [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                                  WithResultString:@"ios6增加用户日记本没有授权"
                                        callbackId:command.callbackId];
                 return ;
             }
             
             //查找是否存在
             [self _ios6LaterSearchReminderWithUUID:uuid
                                  andReturnReminder:^(EKEvent *reminder)
              {
                  
                  if (reminder != nil)
                  {
                      NSLog(@"增加提醒已经有这个id了uuid = %@",uuid);
                      
                      [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                                       WithResultString:@"已经有这个id了"
                                             callbackId:command.callbackId];
                      return ;
                  }
                  
                  [self _ios6LaterAddEKEventWithInformation:notificationAlertInformation
                                              WithTimeStamp:dateStamp
                                               WithTimeZone:[NSTimeZone systemTimeZone]
                                         withRepeatInterval:interval
                                                   withUUID:uuid
                                            withDescription:description
                                              withDateBegin:beginDateStamp
                                                withDateEnd:lastDateStamp
                                               withLocation:location
                                           withstrBoolAhead:strBoolAhead
                                             withOffsetTime:offSetTime];
                  
                  
                  [self _sendResultWithPluginResult:CDVCommandStatus_OK
                                   WithResultString:@"成功"
                                         callbackId:command.callbackId];
              }];
         }];
    }
    NSLog(@"增加提醒成功");
}

/*
 delete
 */

-(void)deleteManyAlarmClock:(CDVInvokedUrlCommand*)command
{
    //传入参数
    NSArray *array = [command.arguments count]>0?[command.arguments objectAtIndex:0]:nil;
    NSLog(@"删除输入的array里应该放UUID的集合array = %@ ",array);
    
    if (!array)
    {
        NSLog(@"参数不全");
        [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                         WithResultString:@"参数不全请查看info"
                               callbackId:command.callbackId];
        return;
    }
    
    //跟着版本走适当途径
    if ([[[UIDevice currentDevice]systemVersion] floatValue] <= 5.0)
    {
        for (NSString *inputUUID in array)
        {
            //查找
            UILocalNotification *searchLocalNotification = [self _searchWithUUID:inputUUID];
            
            //判断是否存在
            if (searchLocalNotification == nil)
            {
                NSLog(@"删除UUID并不存在 UUID = %@ ",[searchLocalNotification.userInfo objectForKey:kCDVLocalNotication_UUID]);
                [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                                 WithResultString:[NSString stringWithFormat:@"删除失败 没有此UUID=  %@",inputUUID]
                                       callbackId:command.callbackId];
                return;
            }
            
            [[UIApplication sharedApplication]cancelLocalNotification:searchLocalNotification];
            NSLog(@"删除UUID成功 UUID = %@ ",[searchLocalNotification.userInfo objectForKey:kCDVLocalNotication_UUID ]);
            [self _sendResultWithPluginResult:CDVCommandStatus_OK
                             WithResultString:[NSString stringWithFormat:@"删除成功 uuid = %@",inputUUID]
                                   callbackId:command.callbackId];
            
        }
    }
    else
    {
        CDVSingletonEventStore  *singletonEventStore = [CDVSingletonEventStore shareObject];
        
        EKEventStore *eventStore = singletonEventStore.eventStore;
        
        //查询是否授权
        [eventStore requestAccessToEntityType:EKEntityTypeEvent completion:^(BOOL granted, NSError *error)
         {
             if (!granted)
             {
                 NSLog(@"ios6删除 用户没有授权");
                 [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                                  WithResultString:@"ios6删除 用户没有授权"
                                        callbackId:command.callbackId];
                 return ;
             }
             
             for (NSString *inputUUID in array)
             {
                 //查找
                 [self _ios6LaterSearchReminderWithUUID:inputUUID
                                      andReturnReminder:^(EKEvent *reminder)
                  {
                      if (reminder == nil)
                      {
                          NSLog(@"删除失败 没有此UUID=");
                          [self _sendResultWithPluginResult:CDVCommandStatus_ERROR
                                           WithResultString:[NSString stringWithFormat:@"删除失败 没有此UUID=  %@",inputUUID] callbackId:command.callbackId];
                          return ;
                      }
                      
                      NSError *error = nil;
                      if([eventStore respondsToSelector:@selector(requestAccessToEntityType:completion:)]) {
                          
                          [eventStore removeEvent:reminder span:EKSpanFutureEvents commit:YES error:&error];
                      } else {
                          [eventStore removeEvent:reminder span:EKSpanFutureEvents error:&error];
                      }
                      
                      [self deleteThecalendarItemIdentifierWithuuid:inputUUID];
                      NSLog(@"%@",error);
                      
                      [self _sendResultWithPluginResult:CDVCommandStatus_OK
                                       WithResultString:[NSString stringWithFormat:@"删除UUID成功 UUID = %@",inputUUID]
                                             callbackId:command.callbackId];
                      
                  }];
             }
         }];
    }
}

/**************************************************************************************/

#pragma mark -
#pragma mark 私有 ios6以下版本 本地通知
#pragma mark -

/**************************************************************************************/

/*
 add
 */

-(void)_addLocalNotificationWithInformation:(NSString*)noticationAlertInformation
                              WithTimeStamp:(NSDate*)date
                               WithTimeZone:(NSTimeZone*)timeZone
                         withRepeatInterval:(NSCalendarUnit)repeatInterval
                                   withUUID:(NSString*)uuid
{
    UILocalNotification *localNotification = [[UILocalNotification alloc]init];
    
    // 推送内容
    localNotification.alertBody = noticationAlertInformation;
    
    // 设置推送时间
    localNotification.fireDate = date;
    
    localNotification.timeZone = timeZone;
    
    //设置重复时间(如果不设置时间过去了这个通知就没有了)
    localNotification.repeatInterval = repeatInterval;
    
    //声音（现在暂时用系统声音）
    localNotification.soundName =  UILocalNotificationDefaultSoundName;
    
    NSDictionary  *dicUserInfoUUID = @{kCDVLocalNotication_UUID :uuid};
    localNotification.userInfo = dicUserInfoUUID;
    
    [[UIApplication sharedApplication]scheduleLocalNotification:localNotification ];
}

/*
 根据UUID查找 UILocalNotification
 */

-(UILocalNotification*)_searchWithUUID:(NSString*)_searchUUID
{
    UILocalNotification *returnlocalNotification = nil;
    
    NSArray *localNotificationArray = [UIApplication sharedApplication].scheduledLocalNotifications;
    
    for (UILocalNotification *localNotifcation in localNotificationArray)
    {
        NSString *strUUID = [localNotifcation.userInfo objectForKey: kCDVLocalNotication_UUID ];
        
        if ([_searchUUID isEqualToString:strUUID])
        {
            returnlocalNotification = localNotifcation;
            
            break;
        }
    }
    return returnlocalNotification;
}

/*
 NSString->NSCalendarUnit
 */

-(NSCalendarUnit)_getNSCalendarUnitWithrepeatInterva:(NSString*)strRepeatInterval
{
    NSCalendarUnit calendarUnit;
    switch ([strRepeatInterval intValue])
    {
        case 0:
            calendarUnit = NSDayCalendarUnit;
            break;
        case 1:
            calendarUnit =NSWeekCalendarUnit;
            break;
        case 2:
            calendarUnit = NSMonthCalendarUnit;
            break;
        case 3:
            calendarUnit = NSYearCalendarUnit;
            break;
        default:
            calendarUnit = 0;
            break;
    }
    return calendarUnit;
}

/*
 NSCalendarUnit->int
 */

-(int)_repeatIntervalWithNSCalendarUnit:(NSCalendarUnit)unit
{
    int intRepeatInterval;
    switch (unit)
    {
        case NSDayCalendarUnit:
            intRepeatInterval = 0;
            break;
        case NSWeekCalendarUnit:
            intRepeatInterval = 1;
            break;
        case NSMonthCalendarUnit:
            intRepeatInterval = 2;
            break;
        default:
            intRepeatInterval = 3;
            break;
    }
    return intRepeatInterval;
}

/**************************************************************************************/

#pragma mark -
#pragma mark 私有  ios6以上版本 通讯录
#pragma mark -

/**************************************************************************************/

/*
 add 日历
 */

-(void)_ios6LaterAddEKEventWithInformation:(NSString*)reminderTitle
                             WithTimeStamp:(NSString*)reminderDate
                              WithTimeZone:(NSTimeZone*)reminderTimeZone
                        withRepeatInterval:(NSString*)interVal
                                  withUUID:(NSString*)reminderUuid
                           withDescription:(NSString*)description
                             withDateBegin:(NSString*)dateBegin
                               withDateEnd:(NSString*)dateEnd
                              withLocation:(NSString*)location
                          withstrBoolAhead:(NSString*)strBoolAhead
                            withOffsetTime:(NSString*)offsetTime
{
    
    CDVSingletonEventStore  *singletonEventStore = [CDVSingletonEventStore shareObject];
    EKEventStore *eventStore = singletonEventStore.eventStore;
    
    EKEvent *event = [EKEvent eventWithEventStore:eventStore];
    event.title             =  reminderTitle;
    event.calendar           = [eventStore defaultCalendarForNewEvents];
    event.timeZone          = reminderTimeZone;
    
    if (strBoolAhead &&![strBoolAhead isEqual:[NSNull null]] &&![strBoolAhead isEqualToString:@""]) {
        
        double doubleOffsetTime;
        if (offsetTime && ![offsetTime isEqual:[NSNull null]]) {
            doubleOffsetTime = [offsetTime doubleValue];
        }
        if ([strBoolAhead isEqualToString:@"ahead" ]) {
            [event addAlarm:[EKAlarm alarmWithRelativeOffset:-doubleOffsetTime]];
        }
        else if ([strBoolAhead isEqualToString:@"back"]) {
            [event addAlarm:[EKAlarm alarmWithRelativeOffset:doubleOffsetTime]];
        }
        else
        {
            NSLog(@"传入strBoolAhead有误");
            return;
        }
    }
    else
    {
        [event addAlarm:[EKAlarm alarmWithAbsoluteDate:[NSDate dateWithTimeIntervalSince1970:reminderDate.doubleValue]]];
    }
    if (description && ![description isEqual:[NSNull null]]) {
        event.notes = description;
    }
    if (dateBegin && ![dateBegin isEqual:[NSNull null]]) {
        event.startDate = [NSDate dateWithTimeIntervalSince1970:dateBegin.doubleValue];
    }
    if (dateEnd && ![dateEnd isEqual:[NSNull null]]) {
        event.endDate = [NSDate dateWithTimeIntervalSince1970:dateEnd.doubleValue];
    }
    if (location && ![location isEqual:[NSNull null]]) {
        event.location = location;
    }
    if (![interVal isEqualToString:@"100"]){
        [event addRecurrenceRule:[[EKRecurrenceRule alloc] initRecurrenceWithFrequency:[self _getEKRecurrenceFrequencyWithstrRepeatInterval:interVal]
                                                                              interval:1
                                                                                   end:nil]];
    }
    
    __block NSError *err;
    //ios 6以后和之前方法不一样
    if([eventStore respondsToSelector:@selector(requestAccessToEntityType:completion:)]) {
        
        [eventStore saveEvent:event span:EKSpanFutureEvents commit:YES error:&err];
    } else {
        [eventStore saveEvent:event span:EKSpanThisEvent error:&err];
    }
    [self saveThecalendarItemIdentifier:event.eventIdentifier WithUUid:reminderUuid];
    NSLog(@"localizedFailureReason%@",err);
}

-(void)saveThecalendarItemIdentifier:(NSString*)calendarItemIdentifier WithUUid:(NSString*)uuid
{
    NSArray *arrayTemp= [[NSUserDefaults standardUserDefaults]objectForKey:KDictionary_Alarm];
    if (arrayTemp == nil) {
        arrayTemp =[NSArray array];
    }
    
    NSMutableArray *array = [NSMutableArray arrayWithArray:arrayTemp];
    [array addObject:@{uuid:calendarItemIdentifier}];
    [[NSUserDefaults standardUserDefaults]setObject:array forKey:KDictionary_Alarm];
}

-(NSString*)getThecalendarItemIdentifierWithUUid:(NSString*)uuid
{
    NSArray *arrayTemp= [[NSUserDefaults standardUserDefaults]objectForKey:KDictionary_Alarm];
    if (arrayTemp) {
        for (NSDictionary *dic in arrayTemp) {
            NSString *uuidStore =[[dic allKeys]objectAtIndex:0];
            if ([uuidStore isEqualToString:uuid]) {
                return [dic objectForKey:uuid];
            }
        }
    }
    return nil;
}


-(void)deleteThecalendarItemIdentifierWithuuid:(NSString*)uuid
{
    NSArray *arrayTemp= [[NSUserDefaults standardUserDefaults]objectForKey:KDictionary_Alarm];
    if (arrayTemp) {
        for (NSDictionary *dic in arrayTemp) {
            if ([[[dic allKeys]objectAtIndex:0]isEqualToString:uuid]) {
                NSMutableArray *arrayChange=[NSMutableArray arrayWithArray:arrayTemp];
                [arrayChange removeObject:dic];
                [[NSUserDefaults standardUserDefaults]setObject:arrayChange forKey:KDictionary_Alarm];
            }
        }
    }
}
/*
 在用户已经授权之后调用  用uuid返回符合标准的EKReminder
 */

-(void)_ios6LaterSearchReminderWithUUID:(NSString*)inputUuid
                      andReturnReminder:(ReminderBolck)reminderBlock

{
    NSString *strcalendarItemIdentifier= [self getThecalendarItemIdentifierWithUUid:inputUuid];
    
    if (strcalendarItemIdentifier) {
        CDVSingletonEventStore  *singletonEventStore = [CDVSingletonEventStore shareObject];
        EKEvent* reminder=(EKEvent*)[singletonEventStore.eventStore eventWithIdentifier:strcalendarItemIdentifier];
        reminderBlock(reminder);
        return;
    }
    reminderBlock(nil);
    
}

/*
 NSString ->EKRecurrenceFrequency
 */

-(EKRecurrenceFrequency)_getEKRecurrenceFrequencyWithstrRepeatInterval:(NSString*)strRepeatInterval
{
    EKRecurrenceFrequency  recurrenceFrenqucy;
    
    switch ([strRepeatInterval intValue])
    {
        case 0:
            recurrenceFrenqucy = EKRecurrenceFrequencyDaily;
            break;
        case 1:
            recurrenceFrenqucy = EKRecurrenceFrequencyWeekly;
            break;
        case 2:
            recurrenceFrenqucy = EKRecurrenceFrequencyMonthly;
            break;
        default:
            recurrenceFrenqucy = EKRecurrenceFrequencyYearly;
            break;
    }
    return recurrenceFrenqucy;
}

/*失败成功后向外传递信息*/

-(void)_sendResultWithPluginResult:(CDVCommandStatus)plugResult
                  WithResultString:(NSString*)resultStr
                        callbackId:(NSString*)callbackId
{
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:plugResult
                                                      messageAsString:resultStr];
    
    [self.commandDelegate sendPluginResult:pluginResult
                                callbackId:callbackId];
}


@end

